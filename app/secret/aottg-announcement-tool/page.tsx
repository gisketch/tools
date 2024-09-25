"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Octokit } from "octokit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

const formatTextAreaContent = (content: string) => {
  return content.trim()
    ? "```\n" +
        content
          .split("\n")
          .map((line) => {
            line = line.trim();
            return line.startsWith("-") ? line : `- ${line}`;
          })
          .join("\n") +
        "\n```"
    : "None";
};

export default function AutoPost() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [changelogVersion, setChangelogVersion] = useState("");
  const [changelogFeatures, setChangelogFeatures] = useState("");
  const [changelogBugfixes, setChangelogBugfixes] = useState("");
  const [changelogDescription, setChangelogDescription] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [environment, setEnvironment] = useState<"live" | "testing">("live");

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const updateLoadingState = (
    isLoading: boolean,
    message: string,
    progress: number
  ) => {
    setIsLoading(isLoading);
    setStatusMessage(message);
    setProgress(progress);
  };

  useEffect(() => {
    document.title = "AoTTG 2 Announcement Tool";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
      setDefaultVersion();
    }
  }, [isAuthenticated, environment]);

  const handleAuth = () => {
    if (authPassword === process.env.NEXT_PUBLIC_AUTH_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const setDefaultVersion = () => {
    const today = new Date();
    const version = `${
      today.getMonth() + 1
    }.${today.getDate()}.${today.getFullYear()}`;
    setChangelogVersion(version);
  };

  const fetchFiles = async () => {
    try {
      const announcementPath = environment === "live" ? "posts" : "test-posts";
      const changelogPath =
        environment === "live" ? "changelog" : "test-changelog";

      const announcementResponse = await octokit.rest.repos.getContent({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        path: announcementPath,
      });

      const changelogResponse = await octokit.rest.repos.getContent({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        path: changelogPath,
      });

      if (
        Array.isArray(announcementResponse.data) &&
        Array.isArray(changelogResponse.data)
      ) {
        setFiles([
          ...announcementResponse.data.map(
            (file: any) => `${announcementPath}/${file.name}`
          ),
          ...changelogResponse.data.map(
            (file: any) => `${changelogPath}/${file.name}`
          ),
        ]);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleAnnouncementSubmit = async () => {
    if (!announcementTitle || !announcementContent) {
      alert("Please enter both title and content");
      return;
    }

    const path = environment === "live" ? "posts" : "test-posts";

    try {
      updateLoadingState(true, "Preparing announcement submission...", 0);

      updateLoadingState(true, "Submitting announcement...", 50);
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        path: `${path}/${announcementTitle}.md`,
        message: `Add ${announcementTitle}.md`,
        content: Buffer.from(announcementContent).toString("base64"),
      });

      updateLoadingState(true, "Fetching updated file list...", 75);
      await fetchFiles();

      updateLoadingState(true, "Announcement submitted successfully!", 100);
      setTimeout(() => updateLoadingState(false, "", 0), 1000);

      setAnnouncementTitle("");
      setAnnouncementContent("");
    } catch (error) {
      console.error("Error submitting announcement:", error);
      updateLoadingState(
        true,
        "Error submitting announcement. Please try again.",
        100
      );
      setTimeout(() => updateLoadingState(false, "", 0), 2000);
    }
  };

  const handleChangelogSubmit = async () => {
    if (!changelogVersion) {
      alert("Please enter a version number");
      return;
    }

    const formattedFeatures = formatTextAreaContent(changelogFeatures);
    const formattedBugfixes = formatTextAreaContent(changelogBugfixes);

    const changelogContent = `## Version ${changelogVersion}
### Features
${formattedFeatures}
### Bugfixes
${formattedBugfixes}

${changelogDescription}`;

    const path = environment === "live" ? "changelog" : "test-changelog";

    try {
      updateLoadingState(true, "Preparing changelog submission...", 0);

      updateLoadingState(true, "Submitting changelog...", 50);
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        path: `${path}/${changelogVersion}.md`,
        message: `Add changelog for version ${changelogVersion}`,
        content: Buffer.from(changelogContent).toString("base64"),
      });

      updateLoadingState(true, "Fetching updated file list...", 75);
      await fetchFiles();

      updateLoadingState(true, "Changelog submitted successfully!", 100);
      setTimeout(() => updateLoadingState(false, "", 0), 1000);

      setChangelogFeatures("");
      setChangelogBugfixes("");
      setChangelogDescription("");
      setDefaultVersion();
    } catch (error) {
      console.error("Error submitting changelog:", error);
      updateLoadingState(
        true,
        "Error submitting changelog. Please try again.",
        100
      );
      setTimeout(() => updateLoadingState(false, "", 0), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">
            Authentication Required
          </h1>
          <Input
            type="password"
            placeholder="Enter password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
          />
          <Button onClick={handleAuth} className="w-full">
            Authenticate
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        AoTTG 2 - announcement and changelog tool
      </h1>

      <Tabs
        value={environment}
        onValueChange={(value) => setEnvironment(value as "live" | "testing")}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs defaultValue="announcement" className="w-full">
        <TabsList>
          <TabsTrigger value="announcement">Announcement</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
        </TabsList>
        <TabsContent value="announcement">
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Enter announcement title"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              className="mb-2"
            />
            <MDEditor
              value={announcementContent}
              onChange={(value) => setAnnouncementContent(value || "")}
              height={400}
            />
          </div>
          <Button onClick={handleAnnouncementSubmit}>
            Submit Announcement
          </Button>
        </TabsContent>
        <TabsContent value="changelog">
          <div className="mb-4 space-y-2">
            <Input
              type="text"
              placeholder="Version"
              value={changelogVersion}
              onChange={(e) => setChangelogVersion(e.target.value)}
            />
            <Textarea
              placeholder="Features (one per line, starting with -)"
              value={changelogFeatures}
              onChange={(e) => setChangelogFeatures(e.target.value)}
              rows={5}
            />
            <Textarea
              placeholder="Bugfixes (one per line, starting with -)"
              value={changelogBugfixes}
              onChange={(e) => setChangelogBugfixes(e.target.value)}
              rows={5}
            />
            <Textarea
              placeholder="Additional description (optional)"
              value={changelogDescription}
              onChange={(e) => setChangelogDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleChangelogSubmit}>Submit Changelog</Button>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Changelog Preview</h3>
            <div className="border p-4 bg-[#0d1117] rounded">
              <MarkdownPreview
                source={`## Version ${changelogVersion}
### Features
${formatTextAreaContent(changelogFeatures)}
### Bugfixes
${formatTextAreaContent(changelogBugfixes)}

${changelogDescription}`}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Existing Files ({environment})
        </h2>
        <ul className="list-disc pl-5">
          {files.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      </div>

      <Dialog open={isLoading} onOpenChange={setIsLoading}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Processing</DialogTitle>
            <DialogDescription>{statusMessage}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Progress value={progress} className="w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
