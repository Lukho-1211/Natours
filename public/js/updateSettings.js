import axios from 'axios';
import { showAlert } from './alert';


    // type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
    console.log('update works from updateSettings [method 2]');
    try {
        const url = type == 'password' 
                    ? 'http://127.0.0.1:3000/api/v1/users/updatePassword' :
                    'http://127.0.0.1:3000/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        
        if(res.data.status === 'success'){
            showAlert('success', `${type.toUpperCase()} updated successfully!`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message); // 'error while updating please try again later'
    }
}



// export const updateData = async (name, email) => {
//     console.log('update works from updateSettings');
//     try {
//         const res = await axios({
//             method: 'PATCH',
//             url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
//             data:{ 
//                 name,
//                 email
//             }
//         });
        
//         if(res.data.success === 'success'){
//            showAlert('success', 'Data updated successfully');
//         }
//     } catch (err) {
//         showAlert('error', err.response.data.message); // 'error while updating please try again later'
//     }
// }