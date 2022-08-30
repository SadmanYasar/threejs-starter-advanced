export interface GridHelperParamsTypes {
    size: number;
    divisions: number;
}

export interface SettingsType {
    debug: boolean;
    camera: {
        pos: {
            x: number;
            y: number;
            z: number;
        };
        fov: number;
        near: number;
        far: number;
    };
}