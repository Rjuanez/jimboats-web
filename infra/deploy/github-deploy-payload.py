"""Emit a quoted deployment script for SSH stdin. Never log or save this output."""
import os
import shlex
import sys


def deployment_payload(env):
    enabled = env.get("CHATGPT_ADS_ENABLED", "") or "false"
    validate_only = env.get("CHATGPT_ADS_VALIDATE_ONLY", "") or "true"
    for name, value in (("CHATGPT_ADS_ENABLED", enabled), ("CHATGPT_ADS_VALIDATE_ONLY", validate_only)):
        if value not in ("true", "false"):
            raise ValueError(f"{name} must be true or false.")
    pixel = env.get("CHATGPT_ADS_PIXEL_ID", "").strip()
    key = env.get("CHATGPT_ADS_CAPI_KEY", "").strip()
    for name, value in (("CHATGPT_ADS_PIXEL_ID", pixel), ("CHATGPT_ADS_CAPI_KEY", key)):
        if "\n" in value or "\r" in value:
            raise ValueError(f"{name} must be a single line.")
        if enabled == "true" and not value:
            raise ValueError(f"{name} is required when Ads is enabled.")
    values = {
        "APP_DIR": env.get("VPS_APP_DIR") or "/srv/jimboats/web",
        "IMAGE_REPOSITORY": env.get("IMAGE_REPOSITORY", ""),
        "IMAGE_TAG": env.get("IMAGE_TAG", "") if env.get("APP_CHANGED") == "true" else "latest",
        "GHCR_USERNAME": env.get("GHCR_USERNAME", ""),
        "GHCR_TOKEN": env.get("GHCR_TOKEN", ""),
        "PIPELINE_CHATGPT_ADS_CONFIG": "1",
        "PIPELINE_CHATGPT_ADS_ENABLED": enabled,
        "PIPELINE_CHATGPT_ADS_PIXEL_ID": pixel,
        "PIPELINE_CHATGPT_ADS_CAPI_KEY": key,
        "PIPELINE_CHATGPT_ADS_VALIDATE_ONLY": validate_only,
    }
    # Validate first, then emit once: never execute a partially generated script.
    lines = ["set -eu"] + [f"export {name}={shlex.quote(value)}" for name, value in values.items()]
    lines.append('exec sh "$APP_DIR/infra/deploy/deploy.sh"')
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    try:
        payload = deployment_payload(os.environ)
    except ValueError as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
    sys.stdout.write(payload)
