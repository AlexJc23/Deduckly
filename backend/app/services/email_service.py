import logging

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.resend_api_key


async def send_email(
    *,
    subject: str,
    html: str,
) -> dict:
    try:
        response = resend.Emails.send(
            {
                "from": settings.from_email,
                "to": settings.support_email,
                "subject": subject,
                "html": html,
                "reply_to": settings.support_email,
            }
        )

        logger.info(
            "Email sent successfully: %s",
            subject,
        )

        return response

    except Exception:
        logger.exception(
            "Failed to send email: %s",
            subject,
        )
        raise