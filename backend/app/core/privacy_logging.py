"""Redact credential query values for released clients in Uvicorn access logs.
Reverse-proxy logging must apply its own equivalent redaction.
"""
import logging
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

class CredentialQueryFilter(logging.Filter):
    def filter(self, record):
        if isinstance(record.args, tuple) and len(record.args) == 5:
            client, method, target, version, status = record.args
            parsed = urlsplit(target)
            query = [(key, "[REDACTED]" if key.lower() in {"refresh_token", "expo_push_token", "token", "code"} else value)
                     for key, value in parse_qsl(parsed.query, keep_blank_values=True)]
            record.args = (client, method, urlunsplit(parsed._replace(query=urlencode(query))), version, status)
        return True


def install_privacy_log_filter():
    logger = logging.getLogger("uvicorn.access")
    if not any(isinstance(item, CredentialQueryFilter) for item in logger.filters):
        logger.addFilter(CredentialQueryFilter())
