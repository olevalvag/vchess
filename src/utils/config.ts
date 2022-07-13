export type UI_CONFIG_OPT = {
  clocks: boolean;
  scoresheet_white: boolean;
  scoresheet_black: boolean;
  chessboard: boolean;
  action_panel: boolean;
  tool_popup: {
    adjust_white_clock: boolean,
    adjust_black_clock: boolean,
    remove_half_moves: boolean,
    change_layout: boolean,
    exit: boolean,
  }
  game_info: {
    title: boolean,
    table: boolean,
    round: boolean,
    players_names: boolean,
  }
  buttons: {
    start_stop: boolean,
    back: boolean,
    forward: boolean,
    player_info: boolean,
    tools: boolean,
    register: boolean,
    flip: boolean,
    brightness: boolean,
    exit: boolean,
  },
  top_menu: {
    logo: boolean,
    menu: {
      help: boolean,
      exit: boolean,
    }
  }
}


export const UI_CONFIG = {

  "Classic": {
    clocks: true,
    scoresheet_white: true,
    scoresheet_black: true,
    chessboard: true,
    action_panel: true,
    game_info: {
      title: true,
      table: true,
      round: true,
      players_names: false,
    },
    buttons: {
      start_stop: true,
      back: true,
      forward: true,
      player_info: true,
      tools: true,
      register: true,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: true,
      change_layout: true,
      exit: true,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  },

  "Blitz": {
    clocks: true,
    scoresheet_white: false,
    scoresheet_black: false,
    chessboard: false,
    action_panel: true,
    game_info: {
      title: true,
      table: true,
      round: true,
      players_names: false,
    },
    buttons: {
      start_stop: true,
      back: false,
      forward: false,
      player_info: true,
      tools: true,
      register: true,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: false,
      change_layout: false,
      exit: true,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  },

  "Rapid": {
    clocks: true,
    scoresheet_white: true,
    scoresheet_black: true,
    chessboard: true,
    action_panel: true,
    game_info: {
      title: true,
      table: true,
      round: true,
      players_names: false,
    },
    buttons: {
      start_stop: true,
      back: true,
      forward: true,
      player_info: true,
      tools: true,
      register: true,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: true,
      change_layout: true,
      exit: true,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  },

  scoresheet_white: {
    clocks: true,
    scoresheet_white: true,
    scoresheet_black: true,
    chessboard: true,
    action_panel: true,
    game_info: {
      title: true,
      round: true,
      table: true,
      players_names: false,
    },
    buttons: {
      start_stop: true,
      back: true,
      forward: true,
      player_info: true,
      tools: true,
      register: true,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: true,
      change_layout: true,
      exit: true,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  },

  scoresheet_black: {
    clocks: true,
    scoresheet_white: true,
    scoresheet_black: true,
    chessboard: true,
    action_panel: true,
    game_info: {
      title: true,
      round: true,
      table: true,
      players_names: false,
    },
    buttons: {
      start_stop: true,
      back: true,
      forward: true,
      player_info: true,
      tools: true,
      register: true,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: true,
      change_layout: true,
      exit: true,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  },

  "Scoresheet only": {
    clocks: false,
    scoresheet_white: false,
    scoresheet_black: true,
    chessboard: true,
    action_panel: true,
    game_info: {
      title: true,
      table: true,
      round: true,
      players_names: true,
    },
    buttons: {
      start_stop: false,
      back: true,
      forward: true,
      player_info: true,
      tools: false,
      register: true,
      flip: true,
      brightness: true,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: true,
      adjust_black_clock: true,
      remove_half_moves: false,
      change_layout: true,
      exit: true,
    },
    top_menu: {
      logo: true,
      menu: {
        help: true,
        exit: true,
      }
    }
  },

  "Table card only": {
    clocks: false,
    scoresheet_white: false,
    scoresheet_black: false,
    chessboard: false,
    action_panel: false,
    game_info: {
      title: true,
      table: true,
      round: true,
      players_names: true,
    },
    buttons: {
      start_stop: false,
      back: false,
      forward: false,
      player_info: false,
      tools: false,
      register: false,
      flip: false,
      brightness: false,
      exit: false
    },
    tool_popup: {
      adjust_white_clock: false,
      adjust_black_clock: false,
      remove_half_moves: false,
      change_layout: false,
      exit: false,
    },
    top_menu: {
      logo: false,
      menu: {
        help: false,
        exit: false,
      }
    }
  }

};
