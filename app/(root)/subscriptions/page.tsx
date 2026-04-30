import { PricingTable } from "@clerk/nextjs";

export default function SubscriptionsPage() {
  return (
    <main className="wrapper container py-10 md:py-20">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Upgrade your library and get more out of your books with our premium features.
        </p>
      </div>

      <div className="flex justify-center">
        <PricingTable />
      </div>


    </main>
  );
}
