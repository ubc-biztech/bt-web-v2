import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { Search } from "lucide-react";
import { fetchBackendFromServer } from "@/lib/db";
import { GetServerSideProps } from "next";
import Link from "next/link";

interface Connection {
  compositeID: string;
  fname: string;
  pronouns: string;
  year: string;
  createdAt: number;
  connectionID: string;
  major: string;
  lname: string;
  type: string;
}

interface ConnectionsPageProps {
  connections: Connection[];
}

const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ connections }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConnections = connections.filter((connection) =>
    `${connection.fname} ${connection.lname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Head>
        <title>Connections History </title>
        <meta
          name="description"
          content="Manage your networking connections and NFC interactions"
        />
      </Head>

      <main className="bg-primary-color min-h-screen w-full">
        <div className="w-full">
          <div className="mx-auto pt-8 md:px-20 px-5 flex flex-col mt-9">
            <span>
              <h2 className="text-white text-xl lg:text-[40px]">
                Connections History
              </h2>
              <div className="flex items-center justify-between h-[40px]">
                <p className="text-[#BDC8E3] font-poppins">
                  View your connection history
                </p>
              </div>
            </span>
            <div className="bg-navbar-tab-hover-bg h-[1px] my-4" />

            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-desat-navy" />
                </div>
                <input
                  type="text"
                  placeholder="Search by user"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-blue-500 border-solid rounded-lg text-desat-navy placeholder-light-grey focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConnections.map((connection) => (
                <div
                  key={connection.connectionID}
                  className="bg-[#131F3B] rounded-lg p-4 border border-[#92A4CD] hover:border-[#92A4CD]/80 transition-colors duration-200 shadow-lg"
                  style={{
                    boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#BDC8E3] rounded-full flex items-center justify-center">
                        <span className="text-[#131F3B] font-semibold text-sm">
                          {connection.fname[0]?.toUpperCase()}
                          {connection.lname[0]?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg">
                          {connection.fname} {connection.lname}
                        </h3>
                        <p className="text-[#BDC8E3] text-sm mt-1">
                          {connection.pronouns}, {connection.major}
                        </p>
                      </div>
                    </div>

                    <Link href={`/profile/${connection.type.split("#")[1]}`}>
                      <button className="text-gray-400 hover:text-white transition-colors duration-200">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredConnections.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No connections found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const nextServerContext = { request: context.req, response: context.res };

  try {
    const response = await fetchBackendFromServer({
      endpoint: "/interactions/journal",
      method: "GET",
      nextServerContext,
    });

    return {
      props: {
        connections: response.data || [],
      },
    };
  } catch (err: any) {
    // Optionally handle auth errors/redirects here
    return {
      props: {
        connections: [],
      },
    };
  }
};

export default ConnectionsPage;
