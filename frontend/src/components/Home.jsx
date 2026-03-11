import React from "react";
import BoardsView from "./BoardsView";
import CrmView from "./CrmView";

const Home = (props) => {
  const { currentPage } = props;

  // Show Boards & Documents view when explicitly on 'boards' page
  if (currentPage === "boards" || currentPage === "home") {
    return <BoardsView {...props} />;
  }

  return <CrmView {...props} />;
};

export default Home;