'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError, User } from '@/types/auth';
import { mockLoginApi,mockRegisterApi } from '@/mock/mockAuth';
export function useAuth() {
    const router = useRouter();
    const[surname, setSurname] = useState('');
    const[name,setName] = useState('');
    const[email,setEmail] = useState('');
    const[password,setPassword] = useState('');
    const[confirmPassword,setConfirmPassword] = useState('');
    const[isLoading,setIsLoading] = useState(false);
    const[errors,setErrors] = useState<FormError>({});
    const[currentUser,setCurrentUser]=useState<User | null>(null);
    const emailRegex=/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-]{2,}$/;
    const validateLoginForm = (): boolean =>{
    const newErrors : FormError = {};
        if(!email){
            newErrors.email='Email không được để trống';
        }else if (!emailRegex.test(email)){
            newErrors.email='Email không hợp lệ';
        }
        if(!password)
        {
            newErrors.password='Mật khẩu không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const validateRegisterForm =():boolean=>{
        const newErrors:FormError={};
        if (!surname.trim()) {
        newErrors.surname = 'Họ không được để trống';
        }

        if (!name.trim()) {
        newErrors.name = 'Tên không được để trống';
        }

        if (!email.trim()) {
        newErrors.email = 'Email không được để trống';
        } else if (!emailRegex.test(email)) {
        newErrors.email = 'Email không đúng định dạng';
        }

        if (!password) {
        newErrors.password = 'Mật khẩu không được để trống';
        } else if (password.length < 6) {
        newErrors.password = 'Mật khẩu phải từ 6 ký tự trở lên';
        }

        if (!confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
        } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp!';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const handleLogin = async(e: React.FormEvent)=>{
        e.preventDefault();
        if(!validateLoginForm()){
            return;
        }
        setIsLoading(true);
        setErrors({});
        try{
            const response=await mockLoginApi(email,password);
            setCurrentUser(response.user);
            localStorage.setItem('accessToken', response.accessToken);
            router.push('/dashboard');
        }catch (err){
            const errorMessage=err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
            setErrors({general:errorMessage});
        }finally{
            setIsLoading(false);
        }
    };
    const handleRegister = async(e: React.FormEvent)=>{
        e.preventDefault();
        if(!validateRegisterForm()){
            return;
        }
        setIsLoading(true);
        setErrors({});
        try {
            // Truyền đúng surname, name sang ABP DTO
                const response = await mockRegisterApi(surname, name, email, password);
                setCurrentUser(response.user);
                localStorage.setItem('accessToken', response.accessToken);
                router.push('/dashboard');
                } catch (err) {
                const errorMessage=err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
                setErrors({general:errorMessage});
                } finally {
                setIsLoading(false);
            }
            }
    return {
    surname,
    setSurname,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    errors,
    currentUser,
    handleLogin,
    handleRegister,
};
}