export interface Report {
    id?: number;
    pic: string;            // path relatif seperti 'assets/filename.jpg'
    jalan: string;
    latitude: number; // string saat dari form
    longitude: number;
    priority: string;
    status: string;
    label_id: number;
    desc: string;
}