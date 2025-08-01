export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <div className="text-6xl">🍲</div>
        <span className="border-l rotate-45 h-6" />
        <div className="text-6xl">🤖</div>
      </div>
      <h1 className="sr-only">NextMeal - AI Recipe Generator</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Transform your ingredients into{" "}
        <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          delicious recipes
        </span>{" "}
        with{" "}
        <span className="font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          AI magic
        </span>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
