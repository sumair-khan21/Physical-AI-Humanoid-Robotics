"""Routers package"""

try:
    from backend.routers import chat
except ModuleNotFoundError:
    from . import chat

__all__ = ["chat"]
