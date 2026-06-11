import { Flex, Loading } from "@atoms";

export const PageLoader = () => (
  <div className="min-h-[280px] py-16">
    <Flex wFull alignCenter justifyCenter>
      <Loading />
    </Flex>
  </div>
);
