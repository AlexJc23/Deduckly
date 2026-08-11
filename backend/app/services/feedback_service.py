from app.models.user import User

from app.services.email_service import send_email


async def send_feedback(
    *,
    user: User,
    feedback_type: str,
    title: str,
    description: str,
    platform: str,
    device_name: str | None,
    os_version: str | None,
    app_version: str | None,
    build_number: str | None,
):
    subject = f"[{feedback_type.upper()}] {title}"

    html = f"""
    <h2>New Feedback</h2>

    <h3>Feedback Details</h3>

    <p>
        <strong>Type:</strong> {feedback_type}<br>
        <strong>Title:</strong> {title}
    </p>

    <hr>

    <h3>Description</h3>

    <p>{description}</p>

    <hr>

    <h3>User</h3>

    <p>
        <strong>Name:</strong> {user.first_name} {user.last_name}<br>
        <strong>Email:</strong> {user.email}<br>
        <strong>User ID:</strong> {user.id}
    </p>

    <hr>

    <h3>Device Information</h3>

    <p>
        <strong>Platform:</strong> {platform}<br>
        <strong>Device:</strong> {device_name or "Unknown"}<br>
        <strong>OS Version:</strong> {os_version or "Unknown"}<br>
        <strong>App Version:</strong> {app_version or "Unknown"}<br>
        <strong>Build Number:</strong> {build_number or "Unknown"}
    </p>
    """

    return await send_email(
        subject=subject,
        html=html,
    )