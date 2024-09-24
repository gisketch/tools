"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { HexColorPicker } from "react-colorful";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ColorNameTool() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#FF0000");
  const [gradientColorA, setGradientColorA] = useState("#FF0000");
  const [gradientColorB, setGradientColorB] = useState("#0000FF");
  const inputRef = useRef<HTMLInputElement>(null);

  const applyColor = () => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== null && end !== null) {
        const colorCode = color.slice(1);
        const newText =
          text.slice(0, start) +
          `[${colorCode}]` +
          text.slice(start, end) +
          text.slice(end);
        setText(newText);
      }
    }
  };

  const applyGradient = () => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      if (start !== null && end !== null) {
        const selectedText = text.slice(start, end);
        const gradientText = selectedText
          .split("")
          .map((char, index) => {
            const ratio = index / (selectedText.length - 1);
            const r = Math.round(
              parseInt(gradientColorA.slice(1, 3), 16) * (1 - ratio) +
                parseInt(gradientColorB.slice(1, 3), 16) * ratio
            );
            const g = Math.round(
              parseInt(gradientColorA.slice(3, 5), 16) * (1 - ratio) +
                parseInt(gradientColorB.slice(3, 5), 16) * ratio
            );
            const b = Math.round(
              parseInt(gradientColorA.slice(5, 7), 16) * (1 - ratio) +
                parseInt(gradientColorB.slice(5, 7), 16) * ratio
            );
            const colorCode = `${r.toString(16).padStart(2, "0")}${g
              .toString(16)
              .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
            return `[${colorCode}]${char}`;
          })
          .join("");
        const newText = text.slice(0, start) + gradientText + text.slice(end);
        setText(newText);
      }
    }
  };

  const renderColoredText = (text: string) => {
    const parts = text.split(/(\[[0-9A-Fa-f]{6}\])/g);
    let currentColor = "";
    return parts.map((part, index) => {
      if (part.match(/^\[[0-9A-Fa-f]{6}\]$/)) {
        currentColor = `#${part.slice(1, -1)}`;
        return null;
      } else {
        return (
          <span key={index} style={{ color: currentColor || "inherit" }}>
            {part}
          </span>
        );
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back to Tools
            </Button>
          </Link>
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-6">AOTTG Color Name Tool</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name-input">Enter your name:</Label>
          <Input
            id="name-input"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1"
          />
        </div>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>How to use</AlertTitle>
          <AlertDescription>
            Select/Highlight the text you want to color before clicking
            &quot;Apply Color&quot; or &quot;Apply Gradient&quot;.
          </AlertDescription>
        </Alert>
        <Tabs defaultValue="solid" className="w-full">
          <TabsList>
            <TabsTrigger value="solid">Solid Color</TabsTrigger>
            <TabsTrigger value="gradient">Gradient</TabsTrigger>
          </TabsList>
          <TabsContent value="solid" className="space-y-4">
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[220px]">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    {color}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pick a color</h4>
                    <HexColorPicker color={color} onChange={setColor} />
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={applyColor}>Apply Color</Button>
            </div>
          </TabsContent>
          <TabsContent value="gradient" className="space-y-4">
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[220px]">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: gradientColorA }}
                    ></div>
                    {gradientColorA}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pick color A</h4>
                    <HexColorPicker
                      color={gradientColorA}
                      onChange={setGradientColorA}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[220px]">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: gradientColorB }}
                    ></div>
                    {gradientColorB}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pick color B</h4>
                    <HexColorPicker
                      color={gradientColorB}
                      onChange={setGradientColorB}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Button onClick={applyGradient}>Apply Gradient</Button>
            </div>
          </TabsContent>
        </Tabs>
        <div>
          <Label>Preview:</Label>
          <div className="mt-1 p-2 bg-gray-800 rounded">
            {renderColoredText(text)}
          </div>
        </div>
        <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
      </div>
    </div>
  );
}
