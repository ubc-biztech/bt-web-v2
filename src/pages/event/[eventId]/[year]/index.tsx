
export default function FormRegister() {
    const handleSubmit = async (data: any) => {
        // TODO: implement API call here
        console.log(data)
    }
   
    return (
        <main className="bg-primary-color min-h-screen">
            <div className="mx-auto flex flex-col">
                <EventForm onSubmit={handleSubmit} />
            </div>
        </main>
    );
}