
export interface Screenshot {
    id: string;
    title: string;
    description: string;
    tags: string[];
    imageUrl: string;
    file: File;
    designSpecs: DesignSpecification | null;
}

export interface DesignSpecification {
    layoutStructure: {
        description: string;
    };
    uiComponents: UIComponent[];
    colorPalette: ColorInfo[];
    typography: TypographyInfo[];
    generalDesignInfo: {
        perceivedStyle: string;
        notes: string;
    };
}

export interface UIComponent {
    type: string;
    label: string;
    properties: Record<string, string>;
}

export interface ColorInfo {
    hex: string;
    role: string;
}

export interface TypographyInfo {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    colorHex: string;
    context: string;
}
