import { users } from "@/utils/users";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
    const supabase = await createClient();
    const { data: { user }} = await supabase.auth.getUser();

    if (!user) redirect('/login');
    
    const userData = await users.getUser(user.id)
    
    if (!userData) redirect('/login');
    return (
        <div>
            <ProfileForm data={userData} />
        </div>
    );
}