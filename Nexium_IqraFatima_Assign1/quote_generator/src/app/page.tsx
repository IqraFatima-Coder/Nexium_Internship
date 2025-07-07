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
    <main className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/wheat.jpg')" }}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded shadow">
          <h1 className="text-xl font-semibold mb-4">Quote Generator</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter topic (e.g. life, success)" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Get Quotes</Button>
            </form>
          </Form>

          {/* Popular Topics */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Popular topics:</p>
            <div className="flex flex-wrap gap-2">
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors capitalize"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {results.map((quote, i) => (
              <div key={i} className="bg-white/80 p-4 border rounded-lg text-sm shadow-sm">
                "{quote}"
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
