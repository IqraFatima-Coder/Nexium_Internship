export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <div className="text-6xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🍲</div>
        <span className="border-l rotate-45 h-6 bg-gradient-to-b from-blue-400 to-blue-600" />
        <div className="text-6xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>🤖</div>
      </div>
      <h1 className="sr-only">NextMeal - AI Recipe Generator</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Transform your ingredients into{" "}
        <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-pulse">
          delicious recipes
        </span>{" "}
        with{" "}
        <span className="font-bold bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse" style={{ animationDelay: '1s' }}>
          AI magic
        </span>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent my-8" />
    </div>
  );
}
