// This file just has type definitions for TypeScript
// No actual javascript is generated from this, so it is not imported into index.html
// like the others
interface Config {
    "data.file_server": string;
    "data.atmospheres": string;
    "data.nlte_grids": string;
    "data.cache.atmospheres": string;
    "data.cache.nlte_grids": string;
    "data.pointers.atmospheres": string;
    "data.pointers.nlte_grids": string;
}

interface ZipObject {
    name: string
    async: Function
}

type LogLevel = "debug" | "warning" | "info" | "error" | "critical";
interface LogEntry {
    level: LogLevel;
    message: string;
    source: string;
    datetime: string;
}

type IntArray = Int16Array | Int8Array | Int32Array | BigInt64Array | Uint8Array
type FloatArray = Float32Array | Float64Array

type AtmosphereGeometry = "PP" | "SPH";
type AtmosphereMethod = "grid" | "embedded";
type AtmosphereAxis = "TAU" | "RHOX";
interface Atmosphere {
    teff: number;
    logg: number;
    vturb: number;
    lonh: number;
    source: string;
    method: AtmosphereMethod;
    geom: AtmosphereGeometry;
    radius: FloatArray;
    height: FloatArray;
    opflag: number[];
    wlstd: number;
    depth: AtmosphereAxis;
    interp: AtmosphereAxis;
    citation_info: string;
}

type AbundanceFormat = "H=12" | "sme" | "n/nTot" | "n/nH";
interface Abundance {
    format: AbundanceFormat;
    monh: number;
    citation_info: string;
}

type LineListFormat = "short" | "long";
type LineListMedium = "air" | "vac";
interface LineList {
    format: LineListFormat;
    medium: LineListMedium;
    citation_info: string;
};

interface NLTE {
    citation_info: string;
    elements: string[];
    grids: { [id: string]: string };
    subgrid_size: number[];
}

type SystemInfo = { [id: string]: string };

type VradFlag = "fix" | "whole" | "each" | "none";
type CscaleFlag = "fix" | "none" | "constant" | "linear";
type CscaleType = "mask" | "whole";
interface SmeFile {
    vrad: FloatArray;
    cscale: FloatArray[];
    wran: FloatArray[];
    "abund/info": Abundance;
    "abund/pattern": FloatArray;
    wave: FloatArray[];
    spec: FloatArray[];
    uncs: FloatArray[];
    mask: IntArray[];
    synth: FloatArray[];
    cont: FloatArray[];
    "linelist/info": LineList;
    "linelist/data": { [id: string]: any };
    "atmo/info": Atmosphere;
    "atmo/rhox": FloatArray;
    "atmo/tau": FloatArray;
    "atmo/temp": FloatArray;
    "atmo/rho": FloatArray;
    "atmo/xna": FloatArray;
    "atmo/xne": FloatArray;
    "atmo/abund/info": { [id: string]: any };
    "atmo/abund/pattern": FloatArray;
    "nlte/info": NLTE;
    "nlte/flags": IntArray;
    "system_info/info": SystemInfo;
    citation_info: string;
    teff: number;
    logg: number;
    vmic: number;
    vmac: number;
    vsini: number;
    id: string;
    object: string;
    version: string;
    vrad_flag: VradFlag;
    cscale_flag: CscaleFlag;
    cscale_type: CscaleType;
    normalize_by_continuum: boolean;
    specific_intensities_only: boolean;
    gam6: number;
    h2broad: boolean;
    accwi: number;
    accrt: number;
    mu: number[]
    fitparameters: string[];
    ipres: number;
}
