from app.core.config import settings
from fastapi import UploadFile, HTTPException
from urllib.parse import urlparse
from urllib.parse import urlsplit
from typing import Optional
from pathlib import Path
import boto3
import uuid




def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key,
        aws_secret_access_key=settings.aws_secret_key,
        region_name=settings.aws_region
    )


def upload_file_to_s3(
    file: UploadFile,
    user_id: int,
) -> str:
    s3_client = get_s3_client()

    extension = Path(file.filename).suffix

    key = (
        f"{user_id}/"
        f"{uuid.uuid4()}{extension}"
    )

    s3_client.upload_fileobj(
        file.file,
        settings.s3_bucket,
        key,
        ExtraArgs={
            "ContentType": file.content_type,
        },
    )

    return (
        f"https://{settings.s3_bucket}"
        f".s3.{settings.aws_region}"
        f".amazonaws.com/{key}"
    )


def owned_receipt_key(file_url: str, user_id: int) -> str:
    """Validate legacy and signed URLs before granting any object capability."""
    from urllib.parse import unquote
    try:
        parsed = urlsplit(file_url)
        host = f"{settings.s3_bucket}.s3.{settings.aws_region}.amazonaws.com"
        key = unquote(parsed.path[1:])
        if (parsed.scheme != "https" or parsed.netloc != host or parsed.fragment
                or not parsed.path.startswith("/") or not key.startswith(f"{user_id}/")
                or len(key.split("/")) < 2 or "%" in key or "\\" in key
                or any(part in ("", ".", "..") for part in key.split("/"))):
            raise ValueError("Unowned receipt")
        return key
    except (ValueError, TypeError, AttributeError):
        raise HTTPException(status_code=403, detail="Receipt does not belong to this account") from None


def owned_receipt_url(file_url: str | None, user_id: int) -> str | None:
    if not file_url:
        return None
    from urllib.parse import quote
    key = owned_receipt_key(file_url, user_id)
    return f"https://{settings.s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{quote(key, safe='/._-')}"


def generate_presigned_url(file_url: str | None, user_id: int) -> str | None:
    if not file_url:
        return None
    key = owned_receipt_key(file_url, user_id)
    return get_s3_client().generate_presigned_url(
        "get_object", Params={"Bucket": settings.s3_bucket, "Key": key}, ExpiresIn=3600,
    )


def delete_file_from_s3(file_url: str, user_id: int):
    key = owned_receipt_key(file_url, user_id)
    try:
        get_s3_client().delete_object(Bucket=settings.s3_bucket, Key=key)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete receipt") from None

def delete_user_files_from_s3(user_id: int) -> None:
    s3_client = get_s3_client()

    bucket_name = settings.s3_bucket
    prefix = f"{user_id}/"

    try:
        while True:
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=1000,
            )

            objects = response.get("Contents", [])

            if not objects:
                break

            delete_response = s3_client.delete_objects(
                Bucket=bucket_name,
                Delete={
                    "Objects": [
                        {"Key": obj["Key"]}
                        for obj in objects
                    ],
                    "Quiet": True,
                },
            )

            errors = delete_response.get("Errors", [])

            if errors:
                raise RuntimeError(
                    "Failed to delete one or more user receipt files"
                )

        verification = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            MaxKeys=1,
        )

        if verification.get("Contents"):
            raise RuntimeError(
                "User receipt files remain after deletion"
            )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to delete account receipt files",
        ) from exc
