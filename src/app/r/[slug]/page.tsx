import { getAuthSession } from "@/lib/auth";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function SubredditPage({ params }: PageProps) {
  const { slug } = params;
  const session = await getAuthSession();

  return <div>Page</div>;
}
