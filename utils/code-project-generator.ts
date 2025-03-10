import { createClient } from "./supabase/client";

export default async function generateProjectCode(category: string) {
    const supabase = createClient();
    try {
        const { count, error } = await supabase
            .from("projects")
            .select("id", { count: "exact" });

        if (error) throw error;

        const totalProjects = (count || 0) + 1;
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const formattedDate = `${year}${month}`;
        const prefix = category === "internal" ? "INT" : "EXT";

        // Urutan proyek, format 3 digit
        const projectNumber = String(totalProjects).padStart(3, "0");

        return `${prefix}-${formattedDate}-${projectNumber}`;
    } catch (error) {
        console.error("Error generating project code:", error);
        return null;
    }
}