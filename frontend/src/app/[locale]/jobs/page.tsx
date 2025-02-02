async function getData() {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return { message: "Data loaded!" };
  }
  
  export default async function TestPage() {
    const data = await getData();
    
    return (
      <div className="p-4">
        <h1>Test Page</h1>
        <p>{data.message}</p>
      </div>
    );
  }