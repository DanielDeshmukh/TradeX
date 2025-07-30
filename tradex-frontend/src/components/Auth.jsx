import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import supabase from "../lib/supabase";

const AuthComponent = () => (
  <div className="flex justify-center items-center min-h-screen bg-black">
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="dark"
      providers={[]}
    />
  </div>
);

export default AuthComponent;
