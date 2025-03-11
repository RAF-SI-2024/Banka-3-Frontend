export interface Payment {
    brojNaloga?: string
    saRacuna: string
    iznos: number
    naRacun: string
    primalac?: string
    adresaPrimaoca?: string
    sifraPlacanja?: string
    pozivNaBroj?: string
    svrhaPlacanja?: string
    datumVremePlacanja?: Date
  }
  