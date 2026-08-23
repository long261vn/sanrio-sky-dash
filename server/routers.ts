import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listLeaderboard, submitScore } from "./leaderboard";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  leaderboard: router({
    top20: publicProcedure.query(() => listLeaderboard()),
    submit: publicProcedure.input(z.object({
      playerId: z.string().uuid(),
      playerName: z.string().trim().min(2).max(20).regex(/^[a-zA-Z0-9À-ỹ _.-]+$/, "Tên chỉ dùng chữ, số, khoảng trắng hoặc - . _"),
      runnerId: z.enum(["cinnamoroll", "pompompurin", "mymelody", "kuromi", "badtzmaru", "keroppi", "gudetama", "hellokitty"]),
      score: z.number().int().min(1).max(1_000_000),
      stars: z.number().int().min(0).max(10_000),
      distance: z.number().int().min(0).max(1_000_000),
    })).mutation(({ input }) => submitScore(input)),
  }),
});

export type AppRouter = typeof appRouter;
