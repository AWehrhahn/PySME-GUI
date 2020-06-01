import argparse
from electron import call

from pysme.sme import SME_Structure
from pysme.persistence import to_flex, from_flex

from flex.flex import FlexFile

"""
When converting files from idl or ech, there is a good chance
they are in big endian as well. So just convert here as well, even if that is 
not DRY.
"""


def to_little_endian(data):
    try:
        dtype = data.dtype.str
        dtype = f"<{dtype[1:]}"
        data = data.astype(dtype)
    except Exception as ex:
        print(ex)
        pass
    return data


@call
def load(fname_in, fname_out):
    sme = SME_Structure.load(fname_in)

    for name in sme._names:
        data = getattr(sme, name)
        setattr(sme, name, to_little_endian(data))

    ff = to_flex(sme)
    ff.to_json(fname_out)


@call
def save(fname_in, fname_out):
    ff = FlexFile.from_json(fname_in)
    sme = SME_Structure()
    sme = from_flex(ff, sme)
    sme.save(fname_out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convert a idl sme file to regular sme file."
    )
    parser.add_argument("input_file", help="sme file to convert")
    parser.add_argument("output_file", help="output file name")
    parser.add_argument("--load", action="store_true")
    parser.add_argument("--save", action="store_true")

    args = parser.parse_args()

    fname_in = args.input_file
    fname_out = args.output_file
    pload = args.load
    psave = args.save

    # When in doubt load wins
    if not pload and not psave:
        pload = True
    elif pload and psave:
        psave = False

    if pload:
        load(fname_in=fname_in, fname_out=fname_out)
    else:
        save(fname_in=fname_in, fname_out=fname_out)
