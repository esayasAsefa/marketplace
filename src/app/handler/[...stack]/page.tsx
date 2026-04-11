import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";
import { Navbar } from "@/components/navbar";

export default function Handler(props: any) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center p-4 pt-24">
        <StackHandler app={stackServerApp} {...props} />
      </main>
    </>
  );
}
