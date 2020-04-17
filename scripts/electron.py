from os.path import dirname, join
from functools import wraps


def call(main):
    secret_log = join(dirname(__file__), "python.txt")

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
            with open(secret_log, "a") as f:
                f.write(str(ex))
            exit(1)

        exit(0)

    return wrapper
