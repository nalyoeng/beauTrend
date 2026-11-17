"""Test package.

Use an in-memory database for every test run; this must happen before any
application module (which creates the SQLAlchemy engine at import time) loads.
"""

import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
