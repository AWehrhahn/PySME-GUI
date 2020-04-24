from os.path import dirname, join
from functools import wraps
import traceback
import sys

secret_log = join(dirname(__file__), "python.txt")


def call(main):
    @wraps(main)
    def wrapper(*args, **kwargs):
        with open(secret_log, "w") as f:
            f.write("Input Parameters:\n")
            for v in args:
                f.write(f"  {v}\n")
            for k, v in kwargs.items():
                f.write(f"  {k}: {v}\n")

        try:
            main(*args, **kwargs)
        except Exception as ex:
            # text = traceback.format_exc(ex)
            text = traceback.format_exception(*sys.exc_info())
            with open(secret_log, "a") as f:
                f.write(str(ex) + "\n")
                f.write("".join(text))
            exit(1)

        exit(0)

    return wrapper


def write_error_message(message, mode="w"):
    with open(secret_log, mode) as f:
        f.write(message + "\n")
