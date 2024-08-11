import { useEffect, useState } from "react";
import axios from "axios";
import AllInbox from "./AllInbox";
import CenterPage from "./CenterPage";
import RightSection from "./RightSection";
import CustomMail from "./CustomMail";

interface MailData {
  id: number;
  fromEmail: string;
  subject: string;
  threadId: number;
}

function MainPage() {
  const [datas, setData] = useState<MailData[]>([]);
  const [selectedThread, setSelectedThread] = useState<number | null>(null);
  const [replyVisible, setReplyVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://hiring.reachinbox.xyz/api/v1/onebox/list",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (replyVisible) return; // Skip handling if reply screen is active

      if (event.key === "D" && selectedThread !== null) {
        handleDelete(selectedThread);
      } else if (event.key === "R" && selectedThread !== null) {
        setReplyVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedThread, replyVisible]);

  const handleDelete = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hiring.reachinbox.xyz/api/v1/onebox/${threadId}`, {
        headers: {
          Authorization: token,
        },
      });
      setData((prevData) => prevData.filter((item) => item.threadId !== threadId));
      setSelectedThread(null);
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const loadMail = (threadId: number) => {
    setSelectedThread(threadId);
  };

  return (
    <div className="bg-[#ECEFF3] dark:bg-black text-white pt-16 flex w-full h-screen">
      <div className="w-1/4">
        <AllInbox data={datas} loadMail={loadMail} />
      </div>
      <div className="w-2/4">
        {/* @ts-ignore */}
        <CenterPage selectedThread={selectedThread} />
      </div>
      <div className="w-1/4">
        <RightSection />
      </div>
      {replyVisible && selectedThread !== null && (
        <CustomMail threadId={selectedThread} onClose={() => setReplyVisible(false)} />
      )}
    </div>
  );
}

export default MainPage;
