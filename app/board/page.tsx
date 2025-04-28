import Board from "./components/Board";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { users } from "@/utils/users";

export default async function Page() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const userData = await users.getUser(user.id);
    if (!userData) redirect('/login');

    return (
        <Board userId={userData.id} />
    );
}