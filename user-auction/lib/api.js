import { auth } from '../firebase';

export const fetchProtectedData = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Không có người dùng');

    const idToken = await user.getIdToken();
    const response = await fetch('http://localhost:3001/api/v1/protected', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });

    if (!response.ok) throw new Error('Lỗi xác thực');
    return response.json();
};