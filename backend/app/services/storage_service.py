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


def generate_presigned_url(file_url: str | None) -> str | None:
    if not file_url:
        return None

    s3_client = get_s3_client()

    prefix = (
        f"https://{settings.s3_bucket}"
        f".s3.{settings.aws_region}.amazonaws.com/"
    )

    key = file_url.removeprefix(prefix)

    url = s3_client.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": key,
        },
        ExpiresIn=3600,
    )



    return url

def delete_file_from_s3(file_url: str):
    s3_client = get_s3_client()

    bucket_name = settings.s3_bucket

    key = file_url.split(
        f"https://{bucket_name}.s3.{settings.aws_region}.amazonaws.com/"
    )[-1]

    try:
        s3_client.delete_object(
            Bucket=bucket_name,
            Key=key,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete file: {str(e)}",
        )

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
