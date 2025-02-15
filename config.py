import os
import logging
from dotenv import load_dotenv

load_dotenv()  # Reads .env file and makes its contents available via os.environ

# ------------------------
# Environment Variables
# ------------------------
API_KEY = os.environ.get("MEXC_API_KEY", "YOUR_DEFAULT_KEY")
API_SECRET = os.environ.get("MEXC_API_SECRET", "YOUR_DEFAULT_SECRET")
USE_SDK = os.environ.get("USE_SDK", "True").lower() == "true"

# Flask settings
FLASK_DEBUG_MODE = os.environ.get("FLASK_DEBUG", "True").lower() == "true"

# Logging Level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

# Results directory
RESULTS_DIR = os.environ.get("RESULTS_DIR", "results")

# ------------------------
# Logging Configuration
# ------------------------
logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)

console_handler = logging.StreamHandler()
console_format = logging.Formatter("[%(asctime)s] %(levelname)s in %(module)s: %(message)s")
console_handler.setFormatter(console_format)
logger.addHandler(console_handler)

# If you want to log to a file instead:
# file_handler = logging.FileHandler("app.log")
# file_handler.setFormatter(console_format)
# logger.addHandler(file_handler)
