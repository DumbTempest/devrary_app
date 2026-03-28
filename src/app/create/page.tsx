"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import { FlipbookPreview } from "@/components/custom/flippage";

const PRESET_TAGS = [
    "javascript", "typescript", "react", "nextjs", "nodejs", "express", "mongodb", "sql", "postgresql", "firebase",
    "html", "css", "tailwind", "bootstrap", "sass", "ui", "ux", "design", "figma", "frontend",
    "backend", "fullstack", "api", "rest", "graphql", "authentication", "authorization", "jwt", "oauth", "security",
    "webdev", "performance", "optimization", "seo", "testing", "jest", "cypress", "vitest", "debugging", "deployment",
    "docker", "kubernetes", "ci/cd", "aws", "azure", "gcp", "cloud", "serverless", "vercel", "netlify",
    "data-structures", "algorithms", "dsa", "recursion", "sorting", "searching", "graphs", "trees", "dp", "greedy",
    "python", "java", "c++", "c", "go", "rust", "kotlin", "swift", "dart", "flutter",
    "machine-learning", "ai", "deep-learning", "nlp", "computer-vision", "data-science", "pandas", "numpy", "tensorflow", "pytorch",
    "blockchain", "web3", "solidity", "crypto", "smart-contracts", "defi", "nft", "cybersecurity", "ethical-hacking", "networking",
    "linux", "bash", "git", "github", "open-source", "system-design", "scalability", "microservices", "event-driven", "architecture"
];

export default function CreatePage() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        author: "",
        duration: "",
        difficulty: "l1",
        domain: "web-dev",
        tags: "",
    });

    const [pages, setPages] = useState<any[]>([
        {
            title: "",
            sections: [{ type: "text", content: "" }],
        },
    ]);

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const addPage = () => {
        setPages([...pages, { title: "", sections: [{ type: "text", content: "" }] }]);
    };

    const addSection = (pageIndex: number) => {
        const updated = [...pages];
        updated[pageIndex].sections.push({ type: "text", content: "" });
        setPages(updated);
    };

    const updateSection = (pIndex: number, sIndex: number, key: string, value: any) => {
        const updated = [...pages];
        updated[pIndex].sections[sIndex][key] = value;
        setPages(updated);
    };

    // 🔥 Generate ID
    const generateId = () => {
        const base = `${form.difficulty}b${1}-${form.domain}-0`;
        return base.toLowerCase();
    };

    const handleSubmit = async () => {
        const id = generateId();

        const payload = {
            _id: id,
            ...form,
            tags: form.tags.split(",").map((t) => t.trim()),
            pages,
        };

        console.log("Payload:", payload);

        // 🔥 POST (you'll implement backend)
        await fetch("/api/books", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" },
        });
    };

    return (
        <main className="min-h-screen bg-[#FAF3E1] p-10">
            <Navbar />

            <div className="flex justify-center mt-10">
                <Card className="p-10 w-[900px] bg-[#F5E7C6] border-4 border-[#222] rounded-3xl shadow-[10px_10px_0px_0px_#222] space-y-8">

                    <h1 className="text-3xl font-bold text-[#222]">Create Book</h1>

                    {/* 🔹 Basic Info */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Basic Info</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="label">Name</label>
                                <input className="input" onChange={(e) => handleChange("name", e.target.value)} />
                            </div>

                            <div>
                                <label className="label">Author</label>
                                <input className="input" onChange={(e) => handleChange("author", e.target.value)} />
                            </div>

                            <div className="col-span-2">
                                <label className="label">Description</label>
                                <textarea className="input h-24 resize-none" onChange={(e) => handleChange("description", e.target.value)} />
                            </div>

                            <div>
                                <label className="label">Duration</label>
                                <input className="input" onChange={(e) => handleChange("duration", e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="font-bold text-[#222] text-sm">
                                    Tags (max 5)
                                </label>

                                {/* Selected Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {form.tags.split(",").filter(Boolean).map((tag: string) => (
                                        <div
                                            key={tag}
                                            className="
          bg-[#FF6D1F]
          text-white
          px-3 py-1
          rounded-lg
          border-2 border-[#222]
          text-sm
          cursor-pointer
        "
                                            onClick={() => {
                                                const updated = form.tags
                                                    .split(",")
                                                    .filter((t: string) => t !== tag)
                                                    .join(",");
                                                handleChange("tags", updated);
                                            }}
                                        >
                                            {tag} ✕
                                        </div>
                                    ))}
                                </div>

                                {/* Preset Tags */}
                                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border-2 border-[#222] p-3 rounded-xl bg-white">
                                    {PRESET_TAGS.map((tag) => {
                                        const selected = form.tags.split(",").includes(tag);

                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                disabled={
                                                    !selected &&
                                                    form.tags.split(",").filter(Boolean).length >= 5
                                                }
                                                onClick={() => {
                                                    let current = form.tags.split(",").filter(Boolean);

                                                    if (selected) {
                                                        current = current.filter((t: string) => t !== tag);
                                                    } else {
                                                        if (current.length >= 5) return;
                                                        current.push(tag);
                                                    }

                                                    handleChange("tags", current.join(","));
                                                }}
                                                className={`
            px-3 py-1 rounded-lg text-sm border-2 border-[#222]
            transition-all
            ${selected
                                                        ? "bg-[#222] text-white"
                                                        : "bg-[#F5E7C6] hover:bg-[#FF6D1F] hover:text-white"}
          `}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Optional manual input */}
                                <input
                                    placeholder="Or type custom tags..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();

                                            const value = (e.target as HTMLInputElement).value.trim();
                                            if (!value) return;

                                            let current = form.tags.split(",").filter(Boolean);

                                            if (current.length >= 5) return;

                                            if (!current.includes(value)) {
                                                current.push(value);
                                            }

                                            handleChange("tags", current.join(","));
                                            (e.target as HTMLInputElement).value = "";
                                        }
                                    }}
                                    className="
                                        border-4 border-[#222]
                                        rounded-xl
                                        bg-white
                                        px-4 py-3
                                        shadow-[4px_4px_0px_0px_#222]
                                        focus:translate-x-[2px]
                                        focus:translate-y-[2px]
                                        focus:shadow-none
                                        transition-all
                                        outline-none
                                        "
                                />
                            </div>

                            <div>
                                <label className="label">Difficulty</label>
                                <select className="input" onChange={(e) => handleChange("difficulty", e.target.value)}>
                                    <option value="l1">Beginner</option>
                                    <option value="l2">Intermediate</option>
                                    <option value="l3">Expert</option>
                                    <option value="l4">Misc</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Domain</label>
                                <select className="input" onChange={(e) => handleChange("domain", e.target.value)}>
                                    <option value="web-dev">Web Dev</option>
                                    <option value="ai">AI / ML</option>
                                    <option value="blockchain">Blockchain</option>
                                    <option value="cybersec">CyberSec</option>
                                    <option value="robotics">Robotics</option>
                                    <option value="cloud">Cloud</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Pages */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Pages</h2>

                        {pages.map((page, pIndex) => (
                            <div
                                key={pIndex}
                                className="
              bg-white
              border-3 border-[#222]
              rounded-2xl
              shadow-[6px_6px_0px_0px_#222]
              p-5
              space-y-4
            "
                            >
                                <div>
                                    <label className="label">Page Title</label>
                                    <input
                                        value={page.title}
                                        onChange={(e) => {
                                            const updated = [...pages];
                                            updated[pIndex].title = e.target.value;
                                            setPages(updated);
                                        }}
                                        className="input"
                                    />
                                </div>

                                {/* Sections */}
                                <div className="space-y-3">
                                    {page.sections.map((section: any, sIndex: number) => (
                                        <div key={sIndex} className="flex gap-3 items-start">
                                            <select
                                                value={section.type}
                                                onChange={(e) =>
                                                    updateSection(pIndex, sIndex, "type", e.target.value)
                                                }
                                                className="input w-[140px]"
                                            >
                                                <option value="text">Text</option>
                                                <option value="highlight">Code</option>
                                                <option value="list">List</option>
                                            </select>

                                            <input
                                                value={section.content}
                                                onChange={(e) =>
                                                    updateSection(pIndex, sIndex, "content", e.target.value)
                                                }
                                                className="input flex-1"
                                                placeholder="Content..."
                                            />
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => addSection(pIndex)}
                                    className="btn-secondary"
                                >
                                    + Add Section
                                </Button>
                            </div>
                        ))}

                        <Button onClick={addPage} className="btn-secondary">
                            + Add Page
                        </Button>
                    </div>

                    {/* Submit */}
                    <Button onClick={handleSubmit} className="btn-primary w-full">
                        Create Book
                    </Button>
                </Card>
            </div>
            <FlipbookPreview
                data={{
                    name: form.name,
                    author: form.author,
                    description: form.description,
                    duration: form.duration,
                    pages: pages
                }}
            />

            {/* Styles */}
            <style jsx>{`
    .input {
  width: 100%;
  padding: 14px 16px;
  border: 4px solid #222;
  border-radius: 14px;
  background: #fff;

  font-size: 16px;
  font-weight: 500;

  outline: none;
  box-shadow: 4px 4px 0px #222;

  transition: all 0.15s ease;
}

.input:focus {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 14px;
  color: #222;
}

    .label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #222;
    }

    .btn-primary {
      background: #ff6d1f;
      color: white;
      border: 4px solid #222;
      border-radius: 14px;
      padding: 14px;
      font-weight: bold;
      box-shadow: 6px 6px 0 #222;
    }

    .btn-secondary {
      background: #fff;
      border: 3px solid #222;
      border-radius: 12px;
      padding: 10px 14px;
      font-weight: 600;
      box-shadow: 4px 4px 0 #222;
    }
  `}</style>
        </main>
    );
}