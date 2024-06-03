import Navbar from "../(dashboard)/_components/navbar";

interface UserProjectLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: UserProjectLayoutProps) => {
    return (
        <div>
            <Navbar />
            <main className="p-0 sm:p-6 md:p-16 lg:px-64">
                {children}
            </main>
        </div>
    );
}

export default DashboardLayout;