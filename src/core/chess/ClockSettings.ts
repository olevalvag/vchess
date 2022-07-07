import Utils from "../../utils/utils";

export type IncrementType = "fischer" | "bronstein" | "simple";

export interface ClockStage {
  moves: number; // use Infinity for the last stage
  timeInMinutes: number;
  incrementInSeconds: number;
  incrementType: IncrementType;
}

export interface ClockSettings {
  stages: ClockStage[];
}

export function parseIncrementType(type: string): IncrementType {
  switch (type) {
    case "Fischer delay":
      return "fischer";
    case "Bronstein delay":
      return "bronstein";
    case "Simple delay":
      return "simple";
    default:
      throw new Error(`Unsupported increment type: ${type}`);
  }
}

export function parseClockSettings(json: string): ClockSettings {
  const checkJson = Utils.isJSON(json);
  if (!checkJson) return null;

  const stages: {
    player: string;
    moves: string;
    time_minutes: string;
    increment_sec: string;
    increment_type: string;
  }[] = JSON.parse(json);

  return {
    stages: stages.map(stage => {
      let moves = Infinity;

      if (Utils.isEmptyString(stage.player)) stage.player = 'both';
      if (Utils.isEmptyString(stage.increment_type)) stage.increment_type = 'Fischer delay';
      if (stage.moves) {
        moves = Utils.checkFinisGameStage(stage.moves) ? Infinity : parseInt(stage.moves);
      }

      const timeInMinutes = parseInt(stage.time_minutes);
      const incrementInSeconds = parseInt(stage.increment_sec);
      const incrementType = parseIncrementType(stage.increment_type);

      return {moves, timeInMinutes, incrementInSeconds, incrementType};
    })
  };
}

export function stringifyClockSettings(clockSettings: ClockSettings): string {
  let stagesJson: {
    moves: number;
    time_minutes: number;
    increment_sec: number;
    increment_type: IncrementType;
  }[];
  let stages = clockSettings.stages;

  stagesJson = stages.map(stage => {
    let moves = Infinity;
    if (stage.moves) {
      moves = Utils.checkFinisGameStage(stage.moves) ? Infinity : stage.moves;
    }

    return {
      moves: moves,
      time_minutes: stage.timeInMinutes,
      increment_sec: stage.incrementInSeconds,
      increment_type: stage.incrementType
    };
  });
  return JSON.stringify(stagesJson);
}


// CLOCK SETTINGS
export const classical__90_30: ClockSettings = {
  stages: [
    {
      timeInMinutes: 90,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const blitz__3_2: ClockSettings = {
  stages: [
    {
      timeInMinutes: 3,
      incrementInSeconds: 2,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const rapid__12_2: ClockSettings = {
  stages: [
    {
      timeInMinutes: 12,
      incrementInSeconds: 2,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const blitz__5_0: ClockSettings = {
  stages: [
    {
      timeInMinutes: 5,
      incrementInSeconds: 0,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const blitz__5_2: ClockSettings = {
  stages: [
    {
      timeInMinutes: 5,
      incrementInSeconds: 2,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const rapid__5_5: ClockSettings = {
  stages: [
    {
      timeInMinutes: 5,
      incrementInSeconds: 5,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const rapid__15_0: ClockSettings = {
  stages: [
    {
      timeInMinutes: 15,
      incrementInSeconds: 0,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const rapid__25_5: ClockSettings = {
  stages: [
    {
      timeInMinutes: 25,
      incrementInSeconds: 5,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const rapid__25_10: ClockSettings = {
  stages: [
    {
      timeInMinutes: 25,
      incrementInSeconds: 10,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const classical__60_30: ClockSettings = {
  stages: [
    {
      timeInMinutes: 60,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
export const classical__90_40_30_30: ClockSettings = {
  stages: [
    {
      timeInMinutes: 90,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: 40
    },
    {
      timeInMinutes: 30,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: 20
    },
    {
      timeInMinutes: 15,
      incrementInSeconds: 30,
      incrementType: "fischer",
      moves: Infinity
    }
  ]
};
