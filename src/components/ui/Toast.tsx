import toast, { ToastOptions } from 'react-hot-toast';
type Message=string; const show=(type:'success'|'error'|'warning'|'info',message:Message,options?:ToastOptions)=>{if(type==='success'||type==='error')return toast[type](message,options);return toast(message,{...options,icon:type==='warning'?'⚠':'ⓘ'});};
export const appToast={success:(m:Message,o?:ToastOptions)=>show('success',m,o),error:(m:Message,o?:ToastOptions)=>show('error',m,o),warning:(m:Message,o?:ToastOptions)=>show('warning',m,o),info:(m:Message,o?:ToastOptions)=>show('info',m,o),dismiss:toast.dismiss};
export { Toaster } from 'react-hot-toast';
