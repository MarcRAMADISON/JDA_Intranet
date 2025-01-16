export interface statistiqueDataObject {
    totalAnnuel: any;
    monthData: {
        nbFiche: any;
        statuts: {
            statut: string;
            nbFiche: any;
        }[];
        label: string;
        index: number;
    }[];
    statuts: {
        statut: string;
        nbFiche: any;
    }[];

}

export const defaultStatistiqueDataObject:statistiqueDataObject={
    totalAnnuel: 0,
    monthData: [],
    statuts: [] 
}