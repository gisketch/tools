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
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trash2, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const sanitizeFileName = (fileName: string) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

type QueueItem = {
  type: "new" | "delete";
  path: string;
  content?: string;
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
  const [titleError, setTitleError] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(-1);
  const [showPushDialog, setShowPushDialog] = useState(false);

  useEffect(() => {
    document.title = "Announcement Tool";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles();
      setDefaultVersion();
    }
  }, [isAuthenticated, environment]);

  const updateLoadingState = (
    isLoading: boolean,
    message: string,
    progress: number
  ) => {
    setIsLoading(isLoading);
    setStatusMessage(message);
    setProgress(progress);
  };

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

  const handleAnnouncementSubmit = () => {
    if (!announcementTitle || !announcementContent) {
      alert("Please enter both title and content");
      return;
    }

    const path = environment === "live" ? "posts" : "test-posts";
    const sanitizedTitle = sanitizeFileName(announcementTitle);
    const fileName = `${sanitizedTitle}.md`;

    if (files.includes(`${path}/${fileName}`)) {
      setTitleError(
        "A file with this name already exists. Please choose a different title or delete the existing file."
      );
      return;
    }

    setQueue([
      ...queue,
      {
        type: "new",
        path: `${path}/${fileName}`,
        content: announcementContent,
      },
    ]);

    setAnnouncementTitle("");
    setAnnouncementContent("");
    setTitleError("");
  };

  const handleChangelogSubmit = () => {
    if (!changelogVersion) {
      alert("Please enter a version number");
      return;
    }

    const path = environment === "live" ? "changelog" : "test-changelog";
    const sanitizedVersion = sanitizeFileName(changelogVersion);
    const fileName = `${sanitizedVersion}.md`;

    if (files.includes(`${path}/${fileName}`)) {
      setTitleError(
        "A file with this version already exists. Please choose a different version or delete the existing file."
      );
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

    setQueue([
      ...queue,
      {
        type: "new",
        path: `${path}/${fileName}`,
        content: changelogContent,
      },
    ]);

    setChangelogFeatures("");
    setChangelogBugfixes("");
    setChangelogDescription("");
    setDefaultVersion();
    setTitleError("");
  };

  const handleDeleteFile = (filePath: string) => {
    setQueue([...queue, { type: "delete", path: filePath }]);
    setFiles(files.filter((file) => file !== filePath));
  };

  const handleRemoveFromQueue = (index: number) => {
    setRemoveIndex(index);
    setShowRemoveDialog(true);
  };

  const confirmRemoveFromQueue = () => {
    const removedItem = queue[removeIndex];
    if (removedItem.type === "delete") {
      setFiles([...files, removedItem.path]);
    }
    setQueue(queue.filter((_, i) => i !== removeIndex));
    setShowRemoveDialog(false);
  };

  const handlePushAll = async () => {
    if (queue.length === 0) {
      alert("Queue is empty. Nothing to push.");
      return;
    }

    setShowPushDialog(true);
  };

  const confirmPushAll = async () => {
    setShowPushDialog(false);
    updateLoadingState(true, "Preparing to push changes...", 0);

    try {
      const timestamp = new Date().toISOString();
      const commitMessage = `Update (${timestamp})\n\n${queue
        .map(
          (item) =>
            `- ${item.type === "new" ? "Add" : "Delete"} ${item.path
              .split("/")
              .pop()}`
        )
        .join("\n")}`;

      const tree = [];
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        updateLoadingState(
          true,
          `Processing item ${i + 1} of ${queue.length}...`,
          (i / queue.length) * 100
        );

        if (item.type === "new") {
          tree.push({
            path: item.path,
            mode: "100644",
            type: "blob",
            content: item.content,
          });
        } else if (item.type === "delete") {
          tree.push({
            path: item.path,
            mode: "100644",
            type: "blob",
            sha: null,
          });
        }
      }

      const currentCommit = await octokit.rest.repos.getCommit({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        ref: "main",
      });

      const newTree = await octokit.rest.git.createTree({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        base_tree: currentCommit.data.commit.tree.sha,
        tree: tree,
      });

      const newCommit = await octokit.rest.git.createCommit({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        message: commitMessage,
        tree: newTree.data.sha,
        parents: [currentCommit.data.sha],
      });

      await octokit.rest.git.updateRef({
        owner: process.env.NEXT_PUBLIC_GITHUB_ORG!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
        ref: "heads/main",
        sha: newCommit.data.sha,
      });

      updateLoadingState(true, "Fetching updated file list...", 90);
      await fetchFiles();

      updateLoadingState(true, "All changes pushed successfully!", 100);
      setTimeout(() => updateLoadingState(false, "", 0), 1000);

      setQueue([]);
    } catch (error) {
      console.error("Error pushing changes:", error);
      updateLoadingState(true, "Error pushing changes. Please try again.", 100);
      setTimeout(() => updateLoadingState(false, "", 0), 2000);
    }
  };

  const handleTabChange = () => {
    setTitleError("");
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
    <div className="container mx-auto p-4 flex">
      <div className="mr-4">
        <h2 className="text-xl font-semibold mb-4">
          Existing Files ({environment})
        </h2>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 rounded border-gray-700 border"
              >
                <span className="text-sm truncate">{file}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteFile(file)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="flex-grow mx-4">
        <h1 className="text-2xl font-bold mb-4">
          AoTTG 2 - announcement and changelog tool
        </h1>

        <Tabs
          value={environment}
          onValueChange={(value) => {
            setEnvironment(value as "live" | "testing");
            handleTabChange();
          }}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          defaultValue="announcement"
          className="w-full"
          onValueChange={handleTabChange}
        >
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
            {titleError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{titleError}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleAnnouncementSubmit}>
              Add Announcement to Queue
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
            {titleError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{titleError}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleChangelogSubmit}>
              Add Changelog to Queue
            </Button>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Changelog Preview</h3>
              <div className="border border-gray-700 p-4 rounded bg-[#0d1117]">
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
      </div>

      <div className="w-64">
        <h2 className="text-xl font-semibold mb-4">Queue</h2>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          {queue.map((item, index) => (
            <div
              key={index}
              className="mb-2 border border-gray-700 p-2 rounded shadow flex justify-between items-center"
            >
              <div>
                <span
                  className={
                    item.type === "new" ? "text-green-600" : "text-red-600"
                  }
                >
                  {item.type === "new" ? (
                    <Plus className="inline-block mr-1 h-4 w-4" />
                  ) : (
                    <Trash2 className="inline-block mr-1 h-4 w-4" />
                  )}
                </span>
                <span className="text-sm">{item.path}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFromQueue(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </ScrollArea>
        <Button onClick={handlePushAll} className="w-full mt-4">
          Push All Changes
        </Button>
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

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from the queue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRemoveFromQueue}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPushDialog} onOpenChange={setShowPushDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Push</DialogTitle>
            <DialogDescription>
              Are you sure you want to push all changes? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPushDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPushAll}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
