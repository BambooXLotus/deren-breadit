type PageProps = {
  params: {
    postId: string;
  };
};

export const dynaimc = "force-dynamic";
export const fetchCache = "force-no-store";

export const Page: React.FC<PageProps> = ({ params }: PageProps) => {
  return <div>Page</div>;
};
