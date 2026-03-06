import logging
import os
import sys

def get_logger(name):
    """
    Returns a configured logger that outputs to both the console
    and the central .tmp/automation.log file.
    """
    logger = logging.getLogger(name)
    
    # Prevent adding multiple handlers if the logger already exists
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Log format
    formatter = logging.Formatter('%(asctime)s - %(name)s - [%(levelname)s] - %(message)s')
    
    # 1. Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # 2. File Handler
    # Get the project root directory based on this file's location (execution/logger.py)
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    log_dir = os.path.join(root_dir, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, 'automation.log')
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger
