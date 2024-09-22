import Image from "next/image";
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

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <Image
              src="/thumb/colorname.jpg"
              alt="AOTTG Color Name Tool"
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle className="text-white">
                AOTTG Color Name Tool
              </CardTitle>
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
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <Image
              src="/thumb/pokemon.jpg"
              alt="Who's That Pokémon?"
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle className="text-white">Who's That Pokémon?</CardTitle>
              <CardDescription className="text-gray-400">
                Pokémon guessing game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Made with React + Redux + TypeScript. Mobile friendly with
                leaderboards.
              </p>
              <Link
                href="https://pokemon.gisketch.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">Play Game</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <Image
              src="/thumb/covid.jpg"
              alt="COVID Armageddon"
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle className="text-white">COVID Armageddon</CardTitle>
              <CardDescription className="text-gray-400">
                2D platformer game developed in Unity 3D
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Champion of the 2021 MCM Youth E-nnovation Summit. A
                post-apocalyptic adventure where a boy travels back in time to
                stop COVID from spreading.
              </p>
              <Link
                href="https://github.com/gisketch/covid-Armageddon/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full">Download Game</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="text-center text-gray-400 mt-12">
        <h3 className="text-xl font-bold mb-2">About Gisketch</h3>
        <ul className="list-none">
          <li>Software Engineer</li>
          <li>AOTTG 2 Game Dev / Web Dev / Manager / 2D Artist</li>
        </ul>
        <p className="mt-4">&copy; 2024 Gisketch. All rights reserved.</p>
      </footer>
    </div>
  );
}
