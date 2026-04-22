export interface Label {
    id?: number;
    nama: string;
    desc: number | string; // string saat dari form
    pic: string;            // path relatif seperti 'assets/filename.jpg'
}