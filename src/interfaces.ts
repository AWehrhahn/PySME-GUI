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

type Dict = { [id: string]: any }
type IntArray = Int16Array | Int8Array | Int32Array | BigInt64Array | Uint8Array
type FloatArray = Float32Array | Float64Array
type Vector = { header: Dict;[id: number]: FloatArray }
type IntVector = { header: Dict;[id: number]: IntArray }


type AbundanceFormat = "H=12" | "sme" | "n/nTot" | "n/nH";
interface Abundance {
    format: AbundanceFormat;
    monh: number;
    citation_info: string;
}

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
    abund_format: AbundanceFormat;
    monh: number;
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
    flags: IntArray;
}

type SystemInfo = { [id: string]: string };

type VradFlag = "fix" | "whole" | "each" | "none";
type CscaleFlag = "fix" | "none" | "constant" | "linear";
type CscaleType = "mask" | "whole";
interface SmeFile {
    header: {
        vrad: FloatArray;
        cscale: FloatArray[];
        wran: FloatArray[];
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
    },
    abund: {
        header: Abundance;
        data: FloatArray;
    },
    wave: Vector;
    spec: Vector;
    uncs: Vector;
    mask: IntVector;
    synth: Vector;
    cont: Vector;
    linelist: {
        header: LineList;
        data: { [id: string]: any };
    };
    atmo: {
        header: Atmosphere;
        rhox: FloatArray;
        tau: FloatArray;
        temp: FloatArray;
        rho: FloatArray;
        xna: FloatArray;
        xne: FloatArray;
        abund: FloatArray;
    }
    nlte: {
        header: NLTE;
    }
    system_info: {
        header: SystemInfo
    }
}
