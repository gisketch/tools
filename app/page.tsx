import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Tools by Gisketch
        </h1>
        <p className="text-xl text-gray-400">
          Useful utilities for gamers and developers
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">AOTTG Color Name Tool</CardTitle>
            <CardDescription className="text-gray-400">
              Create colorful names for Attack on Titan Tribute Game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Easily generate colored names with solid colors or gradients for
              use in AOTTG.
            </p>
            <Link href="/tools/aottg-color-name-tool">
              <Button className="w-full">Use Tool</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Add more tool cards here in the future */}
      </div>
    </div>
  );
}
