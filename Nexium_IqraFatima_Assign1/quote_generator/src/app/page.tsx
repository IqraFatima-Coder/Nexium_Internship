"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotes } from "@/data/quotes";

const formSchema = z.object({
  topic: z.string().min(1, "Please enter a topic."),
});

export default function QuoteForm() {
  const [results, setResults] = useState<string[]>([]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { topic: "" },
  });

  const popularTopics = ["success", "life", "inspiration", "motivation", "happiness", "wisdom", "courage", "friendship"];

  const onSubmit = (data: { topic: string }) => {
    const filtered = quotes
      .filter((q) => q.topic.toLowerCase().includes(data.topic.toLowerCase()))
      .map((q) => q.text)
      .slice(0, 3);
    setResults(filtered);
  };

  const handleTopicClick = (topic: string) => {
    form.setValue("topic", topic);
    onSubmit({ topic });
  };

  return (
    <main className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/tree.jpg')" }}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white/60 backdrop-blur-sm rounded-lg shadow-lg border border-green-200">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Quote Generator</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter topic (e.g. life, success)"
                        className="placeholder:text-gray-400 border-green-300 focus:border-green-500 focus:ring-green-500"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
                Get Quotes
              </Button>
            </form>
          </Form>

          {/* Popular Topics */}
          <div className="mt-6">
            <p className="text-sm text-gray-700 mb-3 font-medium">Popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm hover:bg-green-100 hover:border-green-300 transition-all capitalize font-medium"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {results.map((quote, i) => (
                <div key={i} className="bg-green-50/80 p-4 border border-green-200 rounded-lg text-sm shadow-sm">
                  <p className="text-gray-700 italic">&ldquo;{quote}&rdquo;</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
