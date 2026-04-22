export interface Item {
    id?: number;
    nama: string;
    tahun: number | string; // string saat dari form
    pic: string;            // path relatif seperti 'assets/filename.jpg'
}