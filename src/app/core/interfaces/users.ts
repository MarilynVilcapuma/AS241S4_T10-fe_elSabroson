export interface Users {
     users_id?: number;
     document_type: string;
     document_number: string;
     name: string;
     last_name: string;
     cellphone: string;
     email: string;
     password?: string;
     role: string;
     registration_date: string;
     state: string;
     imagePath?: string;

     showPassword?: boolean;
}
